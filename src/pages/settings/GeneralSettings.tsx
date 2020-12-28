import React from 'react'
import {Pane, SelectField, Button, toaster} from 'evergreen-ui'
import {useLocale, useVideoDeviceId, withErrorBoundary} from '../../utilities'
import {SPACING} from '../../constants'

const PAGE_WRAPPER_STYLE = {padding: `0 ${SPACING}px`}

function GeneralSettings() {
  const [locale, setLocale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.GENERAL_SETTINGS

  const [language, setLanguage] = React.useState(locale.language)

  const [videoDevices, setVideoDevices] = React.useState([])

  const [videoDeviceId, setVideoDeviceId] = useVideoDeviceId()

  const [selectedDeviceId, setSelectedDeviceId] = React.useState(videoDeviceId)

  const handleLanguageChange = React.useCallback(
    (e: any) => {
      setLanguage(e.target.value)
    },
    [setLanguage],
  )

  const handleSelectedDeviceIdChange = React.useCallback(
    (e: any) => {
      setSelectedDeviceId(e.target.value)
    },
    [setSelectedDeviceId],
  )

  const handleSave = React.useCallback(() => {
    setLocale(language)
    setVideoDeviceId(selectedDeviceId)
    toaster.success(PAGE_CONST.TOASTER.CHANGES_SAVED)
  }, [language, setLocale, selectedDeviceId, setVideoDeviceId, PAGE_CONST])

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices: any) => {
      const videoDevicesList = devices.filter(
        (device: any) => device.kind === 'videoinput' && device.label,
      )

      setVideoDevices(videoDevicesList)
    })
  }, [setVideoDeviceId])

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
        value={selectedDeviceId}
        onChange={handleSelectedDeviceIdChange}
      >
        {videoDevices.map((device: any) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
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
