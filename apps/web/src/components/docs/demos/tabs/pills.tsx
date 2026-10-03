import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/Tabs";

export default function TabsPills() {
  return (
    <Tabs defaultValue="week" variant="pills" size="sm" activationMode="manual">
      <TabList aria-label="Report range">
        <Tab value="day">Day</Tab>
        <Tab value="week">Week</Tab>
        <Tab value="month">Month</Tab>
      </TabList>
      <TabPanel value="day">1,204 visits today.</TabPanel>
      <TabPanel value="week">8,391 visits this week.</TabPanel>
      <TabPanel value="month">35,870 visits this month.</TabPanel>
    </Tabs>
  );
}
