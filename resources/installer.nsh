!include "WordFunc.nsh"

!macro customInit
  ReadRegStr $R0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayVersion"
  ${If} $R0 != ""
    ${VersionCompare} "$R0" "${VERSION}" $R1
    ${If} $R1 == 1
      MessageBox MB_OK|MB_ICONSTOP "TennoFrame v$R0 is already installed on this PC.$\r$\n$\r$\nInstalling an older version (v${VERSION}) is disabled. Please use the latest release."
      Abort
    ${EndIf}
  ${EndIf}
!macroend
