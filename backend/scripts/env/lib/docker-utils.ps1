<#
.SYNOPSIS
Docker Desktop 工具函数库
.DESCRIPTION
提供 Docker 安装、配置和验证的通用函数
.NOTES
保存编码：UTF-8 with BOM | 兼容：PowerShell 5.1+
#>

# 导入通用工具库（如果尚未导入）
if (-not (Test-Path variable:global:CommonUtilsLoaded)) {
    $LibDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    . "$LibDir\common-utils.ps1"
    Set-Variable -Name CommonUtilsLoaded -Value $true -Scope Global
}

# Docker Desktop 安装函数
function Install-DockerDesktop {
    <#
    .SYNOPSIS
    安装 Docker Desktop
    .DESCRIPTION
    优先使用 Winget 安装，失败则尝试 Scoop
    #>
    Log "Installing Docker Desktop..."

    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Log "  Using Winget to install Docker Desktop"
        try {
            & winget install --id Docker.DockerDesktop `
                -e --accept-package-agreements --accept-source-agreements `
                --silent --disable-interactivity 2>$null
            Log "    [OK] Docker Desktop install submitted via Winget (wait for background completion)"
            return $true
        } catch {
            Warn "    [FAILED] Winget install Docker failed: $($_.Exception.Message)"
        }
    }

    # Winget 失败，尝试 Scoop
    Log "  Winget not available, trying Scoop..."
    try {
        & scoop install docker 2>$null
        Log "    [OK] Docker CLI installed via Scoop"
        return $true
    } catch {
        ErrorLog "    [ERROR] Failed to install Docker via Scoop: $($_.Exception.Message)"
        return $false
    }
}

function Configure-DockerService {
    <#
    .SYNOPSIS
    配置 Docker 服务（自动启动）
    .DESCRIPTION
    设置 Docker 服务为自动启动并立即启动
    需要管理员权限
    #>
    param(
        [bool]$IsAdmin = $false
    )

    if (-not $IsAdmin) {
        Warn "Docker service configuration requires administrator privileges (skipped)"
        return $false
    }

    Log "Configuring Docker service..."

    # 查找 Docker 服务
    $dockerServiceName = $null
    if (Get-Service -Name com.docker.service -ErrorAction SilentlyContinue) {
        $dockerServiceName = "com.docker.service"
    } elseif (Get-Service -Name docker -ErrorAction SilentlyContinue) {
        $dockerServiceName = "docker"
    }

    if (-not $dockerServiceName) {
        Warn "  Docker service not found (Docker Desktop may not be installed yet)"
        return $false
    }

    Log "  Found Docker service: $dockerServiceName"

    try {
        # 设置为自动启动
        Log "  Setting startup type to Automatic..."
        Set-Service -Name $dockerServiceName -StartupType Automatic -ErrorAction Stop
        Log "    [OK] Startup type set to Automatic"

        # 启动服务
        Log "  Starting Docker service..."
        Start-Service -Name $dockerServiceName -ErrorAction Stop
        Log "    [OK] Docker service started successfully"

        return $true
    } catch {
        Warn "  [FAILED] Failed to configure Docker service: $($_.Exception.Message)"
        return $false
    }
}

function Verify-DockerInstallation {
    <#
    .SYNOPSIS
    验证 Docker 安装
    .DESCRIPTION
    检查 Docker 是否可用，并显示版本信息
    #>
    Log "Verifying Docker installation..."

    if (Get-Command docker -ErrorAction SilentlyContinue) {
        try {
            $dockerVersion = & docker --version 2>&1
            Log "  [OK] Docker is available: $dockerVersion"
            return $true
        } catch {
            Warn "  [WARNING] Docker command found but failed to run: $($_.Exception.Message)"
            return $false
        }
    } else {
        Warn "  [NOT FOUND] Docker command not available"
        return $false
    }
}

function Initialize-Docker {
    <#
    .SYNOPSIS
    初始化 Docker（安装 + 配置 + 验证）
    .PARAMETER SkipDocker
    是否跳过 Docker 安装
    .PARAMETER IsAdmin
    是否以管理员权限运行
    #>
    param(
        [bool]$SkipDocker = $false,
        [bool]$IsAdmin = $false
    )

    if ($SkipDocker) {
        Log "Skipping Docker installation per -SkipDocker"
        return $true
    }

    Log "========== Initializing Docker =========="

    # 1. 安装 Docker
    $installSuccess = Install-DockerDesktop

    if (-not $installSuccess) {
        Warn "Docker installation failed or was skipped"
    }

    # 2. 配置 Docker 服务
    $configSuccess = Configure-DockerService -IsAdmin $IsAdmin

    if (-not $configSuccess) {
        Log "Docker service configuration skipped (may require admin privileges or Docker not installed yet)"
    }

    # 3. 验证 Docker
    $verifySuccess = Verify-DockerInstallation

    if (-not $verifySuccess) {
        Warn "Docker verification failed (Docker Desktop may still be installing in background)"
    }

    return $true
}
