import React from 'react'
import {Pane, SelectField, Button, toaster} from 'evergreen-ui'
import {
  useLocale,
  useAccount,
  useDatabase,
  downloadObjectAsJSON,
  readJSONData,
  withErrorBoundary,
} from '../../utilities'
import {SPACING} from '../../constants'
import RIGHTS from '../../constants/rights'

const PAGE_WRAPPER_STYLE = {padding: `0 ${SPACING}px`}

const OPTION_IMPORT_DATA = 'importData'
const OPTION_EXPORT_DATA = 'exportData'

const EXPORT_FILE_NAME_PREFIX = 'backup'

function Backup() {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const {TOASTER, CONTROLS, INPUTS} = locale.vars.PAGES.BACKUP

  const [{permissions}] = useAccount()

  const db = useDatabase()

  const [actionType, setActionType] = React.useState(() => {
    let defaultActionType = ''
    if (permissions.includes(RIGHTS.CAN_EXPORT_DATA)) {
      defaultActionType = OPTION_EXPORT_DATA
    } else if (
      !permissions.includes(RIGHTS.CAN_EXPORT_DATA) &&
      permissions.includes(RIGHTS.CAN_IMPORT_DATA)
    ) {
      defaultActionType = OPTION_IMPORT_DATA
    }

    return defaultActionType
  })

  const [isProcessing, setIsProcessing] = React.useState(false)

  const fileInputRef = React.useRef<any>()

  const handleLanguageChange = React.useCallback(
    (e: any) => {
      setActionType(e.target.value)
    },
    [setActionType],
  )

  const handleSelectImportFile = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const [uploadedFile]: any = e.target.files

      if (uploadedFile) {
        setIsProcessing(true)
        readJSONData(uploadedFile)
          .then((obj: any) => {
            db.importObjectStoresData(obj).then((result: any) => {
              if (result) {
                toaster.success(TOASTER.IMPORT_SUCCESS)
              }
              setIsProcessing(false)
            })
          })
          .catch((errMsg: string) => {
            setIsProcessing(false)
            toaster.danger(errMsg)
          })
      }
    },
    [db, setIsProcessing, TOASTER],
  )

  const handleSave = React.useCallback(() => {
    if (actionType === OPTION_EXPORT_DATA) {
      setIsProcessing(true)

      db.exportObjectStoresData().then((data: any) => {
        const dateString = new Date()
          .toLocaleString(STRING_FORMAT)
          .replace(/,/gi, '')
          .replace(/:/gi, '-')
          .split(' ')
          .join('_')
        const fileName = `${EXPORT_FILE_NAME_PREFIX}_${dateString}`
        downloadObjectAsJSON(data, fileName)

        toaster.success(TOASTER.EXPORT_SUCCESS)

        setIsProcessing(false)
      })
    } else if (actionType === OPTION_IMPORT_DATA && fileInputRef.current) {
      const clickEvent = new MouseEvent('click')
      fileInputRef.current.dispatchEvent(clickEvent)
    }
  }, [actionType, db, setIsProcessing, STRING_FORMAT, TOASTER])

  return (
    <Pane style={PAGE_WRAPPER_STYLE}>
      <SelectField
        label={INPUTS.ACTION}
        width={200}
        marginBottom={SPACING * 1.5}
        value={actionType}
        onChange={handleLanguageChange}
      >
        {permissions.includes(RIGHTS.CAN_IMPORT_DATA) && (
          <option value={OPTION_IMPORT_DATA}>
            {INPUTS.OPTION_IMPORT_DATA}
          </option>
        )}
        {permissions.includes(RIGHTS.CAN_EXPORT_DATA) && (
          <option value={OPTION_EXPORT_DATA}>
            {INPUTS.OPTION_EXPORT_DATA}
          </option>
        )}
      </SelectField>

      <Button
        appearance="primary"
        isLoading={isProcessing}
        width="auto"
        onClick={handleSave}
      >
        {CONTROLS.APPLY_BUTTON_TITLE}
      </Button>

      {actionType === OPTION_IMPORT_DATA && (
        <input
          ref={fileInputRef}
          hidden
          type="file"
          onChange={handleSelectImportFile}
        />
      )}
    </Pane>
  )
}

export default withErrorBoundary(Backup)
