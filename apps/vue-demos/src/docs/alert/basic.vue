<script setup lang="ts">
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "../../components/ui/alert";
</script>

<template>
  <Alert status="info">
    <AlertIcon>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 7v4M8 5h.01" strokeLinecap="round" />
      </svg>
    </AlertIcon>
    <AlertContent>
      <AlertTitle>Scheduled maintenance</AlertTitle>
      <AlertDescription
        >The dashboard will be read-only on Sunday from 02:00 to 04:00
        UTC.</AlertDescription
      >
    </AlertContent>
  </Alert>
</template>
