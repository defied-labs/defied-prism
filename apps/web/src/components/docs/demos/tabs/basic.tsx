import { useState } from "react";

import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/Tabs";

export default function TabsBasic() {
  const [value, setValue] = useState("account");
  return (
    <div>
      <Tabs value={value} onValueChange={setValue}>
        <TabList aria-label="Settings">
          <Tab value="account">Account</Tab>
          <Tab value="password">Password</Tab>
          <Tab value="billing" disabled>
            Billing
          </Tab>
          <Tab value="team">Team</Tab>
        </TabList>
        <TabPanel value="account">Update your name and email address.</TabPanel>
        <TabPanel value="password">Change your password and sign out other sessions.</TabPanel>
        <TabPanel value="billing">Manage your plan and payment methods.</TabPanel>
        <TabPanel value="team">Invite people and manage their roles.</TabPanel>
      </Tabs>
      <p>Selected: {value}</p>
    </div>
  );
}
