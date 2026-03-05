import { Editor, type EditorProps, type ImagePickerHandler, type ImageUploadHandler } from "../../../src/components/ui/editor";

const onRequestImage: ImagePickerHandler = async () => ({
  kind: "url",
  src: "https://example.com/image.png",
  alt: "Example image",
});

const onUploadImage: ImageUploadHandler = async (file) => ({
  src: URL.createObjectURL(file),
  alt: file.name,
});

const props: EditorProps = {
  value: "",
  onChange: () => undefined,
  format: "markdown",
  enableImages: true,
  onRequestImage,
  onUploadImage,
};

export const Smoke = () => <Editor {...props} />;
