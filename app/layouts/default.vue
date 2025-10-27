<template>
    <div class="container mx-auto py-6">
        <NavBar/>

        <div class="px-6 mt-12">
            <slot/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import NavBar from '~/components/navigation/NavBar.vue';
</script>
