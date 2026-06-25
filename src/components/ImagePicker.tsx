import { MediaPicker } from './MediaPicker'

type ImagePickerProps = {
  label: string
  value: string | null
  onChange: (id: string | null) => void
}

export function ImagePicker(props: ImagePickerProps) {
  return <MediaPicker {...props} filter="image" />
}
