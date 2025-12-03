export function useFeatureFlags() {
    const appConfig = useAppConfig();

    const features = computed(() => appConfig.features ?? {});
    const isTripOptionsUxEnabled = computed(() => features.value.tripOptionsUx);

    return {
        features,
        isTripOptionsUxEnabled
    }

}