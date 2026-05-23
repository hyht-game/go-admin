<#
.SYNOPSIS
Go 环境配置工具函数库
.DESCRIPTION
提供 Go 运行时安装、环境变量配置、插件和 CLI 工具安装的通用函数
.NOTES
保存编码：UTF-8 with BOM | 兼容：PowerShell 5.1+
#>

# 导入通用工具库（如果尚未导入）
if (-not (Test-Path variable:global:CommonUtilsLoaded)) {
    $LibDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    . "$LibDir\common-utils.ps1"
    Set-Variable -Name CommonUtilsLoaded -Value $true -Scope Global
}

# ========== Go 环境配置函数 ==========
function Install-GoRuntime {
    <#
    .SYNOPSIS
    安装 Go 运行时
    .DESCRIPTION
    通过 Scoop 安装 Go，如果已安装则跳过
    #>
    Log "Installing Go runtime..."

    if (Get-Command go -ErrorAction SilentlyContinue) {
        $goVersion = & go version 2>&1
        Log "  [SKIP] Go already installed: $goVersion"
        return $true
    }

    try {
        Log "  Installing Go via Scoop..."
        & scoop install go 2>$null
        if ($LASTEXITCODE -eq 0) {
            $goVersion = & go version 2>&1
            Log "    [OK] Go installed successfully: $goVersion"
            return $true
        } else {
            Warn "    [FAILED] Go installation failed"
            return $false
        }
    } catch {
        Warn "  [ERROR] Failed to install Go: $($_.Exception.Message)"
        return $false
    }
}

function Set-GoEnvironment {
    <#
    .SYNOPSIS
    配置 Go 环境变量
    .PARAMETER GoPath
    GOPATH 目录路径
    .PARAMETER GoProxy
    Go 代理地址
    #>
    param(
        [string]$GoPath = (Join-Path $env:USERPROFILE "go"),
        [string]$GoProxy = "https://goproxy.io,direct"
    )

    Log "Setting Go environment variables..."

    # 创建 GOPATH 目录
    if (-not (Test-Path $GoPath)) {
        Log "  Creating GOPATH directory: $GoPath"
        New-Item -Path $GoPath -ItemType Directory -Force | Out-Null
        Log "    [OK] GOPATH directory created"
    } else {
        Log "  [SKIP] GOPATH directory already exists: $GoPath"
    }

    # 配置当前会话的 GOPATH
    Log "  Setting GOPATH for current session..."
    $env:GOPATH = $GoPath
    Log "    [OK] GOPATH set to: $GoPath"

    # 配置 GOBIN
    $goBinPath = Join-Path $GoPath "bin"
    if (-not (Test-Path $goBinPath)) {
        New-Item -Path $goBinPath -ItemType Directory -Force | Out-Null
    }

    # 添加 GOBIN 到 PATH
    if (-not ($env:PATH -like "*$goBinPath*")) {
        Log "  Adding GOBIN to PATH: $goBinPath"
        $env:PATH += ";$goBinPath"
        Log "    [OK] GOBIN added to PATH"
    } else {
        Log "  [SKIP] GOBIN already in PATH"
    }

    return $GoPath, $goBinPath
}

function Set-GoProxy {
    <#
    .SYNOPSIS
    配置 Go 代理和 GO111MODULE
    .PARAMETER GoProxy
    Go 代理地址
    .PARAMETER GoModuleOn
    是否启用 GO111MODULE（默认 $true）
    #>
    param(
        [string]$GoProxy = "https://goproxy.io,direct",
        [bool]$GoModuleOn = $true
    )

    Log "Setting Go proxy and module..."

    try {
        # 配置 GOPROXY
        Log "  Setting GOPROXY: $GoProxy"
        & go env -w GOPROXY=$GoProxy 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Log "    [OK] GOPROXY configured"
        } else {
            Warn "    [FAILED] Failed to set GOPROXY"
        }

        # 配置 GO111MODULE
        if ($GoModuleOn) {
            Log "  Enabling GO111MODULE..."
            & go env -w GO111MODULE=on 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Log "    [OK] GO111MODULE enabled"
            } else {
                Warn "    [FAILED] Failed to enable GO111MODULE"
            }
        } else {
            Log "  [SKIP] GO111MODULE disabled"
        }

        # 显示配置结果
        Log "  Current Go environment:"
        $goEnv = & go env GOPROXY 2>&1
        Log "    GOPROXY: $goEnv"
        $goModule = & go env GO111MODULE 2>&1
        Log "    GO111MODULE: $goModule"

        return $true
    } catch {
        Warn "Failed to configure Go proxy: $($_.Exception.Message)"
        return $false
    }
}

function Install-GoPackages {
    <#
    .SYNOPSIS
    统一安装 Go 包的函数
    .PARAMETER Packages
    要安装的 Go 包列表（数组）
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string[]]$Packages
    )

    if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
        ErrorLog "Go not found, cannot install packages"
        return
    }

    foreach ($pkg in $Packages) {
        Log "Installing Go package: $pkg"
        try {
            & go install $pkg 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Log "  [OK] Successfully installed: $pkg"
            } else {
                Warn "  [FAILED] Installation failed: $pkg"
            }
        } catch {
            Warn "  [ERROR] Failed to install $pkg : $($_.Exception.Message)"
        }
    }
}

function Install-GoPlugins {
    <#
    .SYNOPSIS
    安装 Protobuf 编译器插件
    #>
    Log "Installing Protobuf compiler plugins..."

    $plugins = @(
        'google.golang.org/protobuf/cmd/protoc-gen-go@latest',
        'google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest',
        'github.com/go-kratos/kratos/cmd/protoc-gen-go-http/v2@latest',
        'github.com/go-kratos/kratos/cmd/protoc-gen-go-errors/v2@latest',
        'github.com/google/gnostic/cmd/protoc-gen-openapi@latest',
        'github.com/envoyproxy/protoc-gen-validate@latest',
        'github.com/menta2k/protoc-gen-redact/v3@latest',
        'github.com/go-kratos/protoc-gen-typescript-http@latest'
    )

    Install-GoPackages -Packages $plugins
}

function Install-GoCliTools {
    <#
    .SYNOPSIS
    安装 CLI 脚手架工具
    .DESCRIPTION
    在此函数中添加项目所需的 CLI 工具
    #>
    Log "Installing CLI scaffold tools..."

    # 示例：安装常用开发工具
    $cliTools = @(
        'github.com/go-kratos/kratos/cmd/kratos/v2@latest',
        'github.com/google/gnostic@latest',
        'github.com/bufbuild/buf/cmd/buf@latest',
        'entgo.io/ent/cmd/ent@latest',
        'github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest',
        'github.com/tx7do/go-wind-toolkit/config-exporter/cmd/cfgexp@latest',
        'github.com/tx7do/go-wind-toolkit/sql-orm/cmd/sql2orm@latest',
        'github.com/tx7do/go-wind-toolkit/sql-proto/cmd/sql2proto@latest',
        'github.com/tx7do/go-wind-toolkit/sql-kratos/cmd/sql2kratos@latest',
        'github.com/tx7do/go-wind-toolkit/gowind/cmd/gow@latest'
    )

    if ($cliTools.Count -gt 0) {
        Install-GoPackages -Packages $cliTools
    } else {
        Log "No CLI tools to install (can be extended in Install-GoCliTools function)"
    }
}

function Initialize-GoEnvironment {
    <#
    .SYNOPSIS
    初始化 Go 环境（安装 + 配置代理 + 安装插件和工具）
    .PARAMETER GoPath
    GOPATH 目录路径
    .PARAMETER GoProxy
    Go 代理地址
    .PARAMETER SkipPlugins
    是否跳过插件安装
    .PARAMETER SkipCliTools
    是否跳过 CLI 工具安装
    #>
    param(
        [string]$GoPath = (Join-Path $env:USERPROFILE "go"),
        [string]$GoProxy = "https://goproxy.io,direct",
        [bool]$SkipPlugins = $false,
        [bool]$SkipCliTools = $false
    )

    Log "========== Initializing Go Environment =========="

    # 1. 安装 Go 运行时
    $runtimeSuccess = Install-GoRuntime
    if (-not $runtimeSuccess) {
        Warn "Go runtime installation failed, skipping further setup"
        return $false
    }

    # 2. 配置 Go 环境变量
    Log ""
    $configPaths = Configure-GoEnvironment -GoPath $GoPath
    $GoPath = $configPaths[0]

    # 3. 配置 Go 代理
    Log ""
    $proxySuccess = Configure-GoProxy -GoProxy $GoProxy -GoModuleOn $true
    if (-not $proxySuccess) {
        Warn "Go proxy configuration failed"
    }

    # 4. 安装 Protobuf 插件
    if (-not $SkipPlugins) {
        Log ""
        Install-GoPlugins
    } else {
        Log "Skipping Go plugins installation per -SkipPlugins"
    }

    # 5. 安装 CLI 脚手架工具
    if (-not $SkipCliTools) {
        Log ""
        Install-GoCliTools
    } else {
        Log "Skipping CLI tools installation per -SkipCliTools"
    }

    Log ""
    Log "========== Go Environment Setup Completed =========="

    return $true
}
