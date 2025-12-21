import { inject, provide, type InjectionKey, type Ref } from "vue"

export const imageSourcesKey = Symbol('imageSources') as InjectionKey<{
  questions: Ref<HTMLImageElement | null>
  answers: Ref<HTMLImageElement | null>
}>

export function provideImageSources(questionImage: Ref<HTMLImageElement | null>, answerImage: Ref<HTMLImageElement | null>) {
  provide(imageSourcesKey, {
    questions: questionImage,
    answers: answerImage
  })
}

export function useImageSources() {
  const imageSources = inject(imageSourcesKey)

  if (!imageSources) {
    throw new Error('Image sources not found')
  }
  
  return imageSources
}