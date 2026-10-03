<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "../../components/ui/breadcrumb";

const path = ["Home", "Acme", "Projects", "Website", "Assets"];
</script>

<template>
  <Breadcrumb :max-items="4" :items-after-collapse="2" separator="›">
    <BreadcrumbItem v-for="label in path" :key="label">
      <BreadcrumbLink href="#">{{ label }}</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbPage>logo.svg</BreadcrumbPage>
    </BreadcrumbItem>
  </Breadcrumb>
</template>
