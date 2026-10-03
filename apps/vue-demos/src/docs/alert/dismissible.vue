<script setup lang="ts">
import { ref } from "vue";
import { Alert, AlertAction, AlertContent, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";

const visible = ref(true);
</script>

<template>
  <Button v-if="!visible" variant="outline" @click="visible = true">Show alert</Button>
  <Alert v-else status="danger" urgent @dismiss="visible = false">
    <AlertContent>
      <AlertTitle>Payment failed</AlertTitle>
      <AlertDescription>Your card was declined. Update it to keep your plan active.</AlertDescription>
    </AlertContent>
    <AlertAction>
      <Button size="sm" variant="outline">Update card</Button>
    </AlertAction>
  </Alert>
</template>
