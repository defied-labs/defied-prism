<script setup lang="ts">
import { Skeleton, SkeletonGroup } from "../../components/ui/skeleton";
</script>

<template>
  <SkeletonGroup label="Loading profile" style="display: flex; gap: 0.75rem; align-items: center">
    <Skeleton variant="circle" style="width: 40px; height: 40px" />
    <div style="display: grid; gap: 0.5rem">
      <Skeleton style="width: 160px" />
      <Skeleton style="width: 100px" />
    </div>
  </SkeletonGroup>
</template>
