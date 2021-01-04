import React from 'react'
import {Pane, SelectField, Button, toaster} from 'evergreen-ui'
import {
  useLocale,
  useVideoDeviceLabel,
  withErrorBoundary,
} from '../../utilities'
import {SPACING} from '../../constants'

const PAGE_WRAPPER_STYLE = {padding: `0 ${SPACING}px`}

function GeneralSettings() {
  const [locale, setLocale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.GENERAL_SETTINGS

  const [language, setLanguage] = React.useState(locale.language)

  const [videoDevices, setVideoDevices] = React.useState([])

  const [videoDeviceLabel, setVideoDeviceLabel] = useVideoDeviceLabel()

  const [selectedDeviceLabel, setSelectedDeviceLabel] = React.useState(
    videoDeviceLabel,
  )

  const handleLanguageChange = React.useCallback(
    (e: any) => {
      setLanguage(e.target.value)
    },
    [setLanguage],
  )

  const handleSelectedDeviceIdChange = React.useCallback(
    (e: any) => {
      setSelectedDeviceLabel(e.target.value)
    },
    [setSelectedDeviceLabel],
  )

  const handleSave = React.useCallback(() => {
    setLocale(language)
    setVideoDeviceLabel(selectedDeviceLabel)
    toaster.success(PAGE_CONST.TOASTER.CHANGES_SAVED)
  }, [
    language,
    setLocale,
    selectedDeviceLabel,
    setVideoDeviceLabel,
    PAGE_CONST,
  ])

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices: any) => {
      const videoDevicesList = devices.filter(
        (device: any) => device.kind === 'videoinput' && device.label,
      )

      setVideoDevices(videoDevicesList)
    })
  }, [setVideoDeviceLabel])

  return (
    <Pane style={PAGE_WRAPPER_STYLE}>
      <SelectField
        label={PAGE_CONST.INPUTS.LANGUAGE}
        width={200}
        marginBottom={SPACING * 1.5}
        value={language}
        onChange={handleLanguageChange}
      >
        <option value="en">English</option>
        <option value="ru">Русский</option>
      </SelectField>
      <SelectField
        label={PAGE_CONST.INPUTS.CAMERA}
        width={200}
        marginBottom={SPACING * 1.5}
        value={selectedDeviceLabel}
        onChange={handleSelectedDeviceIdChange}
      >
        {videoDevices.map(({label}: any) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </SelectField>
      <Button appearance="primary" width="auto" onClick={handleSave}>
        {PAGE_CONST.CONTROLS.SAVE_BUTTON_TITLE}
      </Button>
    </Pane>
  )
}

export default withErrorBoundary(GeneralSettings)
