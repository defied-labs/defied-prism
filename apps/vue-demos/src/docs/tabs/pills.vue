<script setup lang="ts">
import { Tab, TabList, TabPanel, Tabs } from "../../components/ui/tabs";
</script>

<template>
  <Tabs default-value="week" variant="pills" size="sm" activation-mode="manual">
    <TabList aria-label="Report range">
      <Tab value="day">Day</Tab>
      <Tab value="week">Week</Tab>
      <Tab value="month">Month</Tab>
    </TabList>
    <TabPanel value="day">1,204 visits today.</TabPanel>
    <TabPanel value="week">8,391 visits this week.</TabPanel>
    <TabPanel value="month">35,870 visits this month.</TabPanel>
  </Tabs>
</template>
