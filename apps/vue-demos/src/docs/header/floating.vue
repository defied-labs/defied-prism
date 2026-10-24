<script setup lang="ts">
import { Button } from "../../components/ui/button";
import {
  Header,
  HeaderActions,
  HeaderBrand,
  HeaderItem,
  HeaderLink,
  HeaderMenu,
  HeaderMenuContent,
  HeaderMenuTrigger,
  HeaderNav,
  HeaderToggle,
} from "../../components/ui/header";

const products = [
  { title: "Defied Prism", href: "#", description: "Pick your stack, own your code.", from: "#7c3aed", to: "#e879f9" },
  { title: "Defied Web Configs", href: "#", description: "Your server configs, anywhere.", from: "#0d9488", to: "#67e8f9" },
];
</script>

<template>
  <Header variant="floating" position="static">
    <HeaderBrand href="#">Defied</HeaderBrand>
    <HeaderNav>
      <HeaderMenu>
        <HeaderMenuTrigger>Services</HeaderMenuTrigger>
        <HeaderMenuContent>
          <HeaderLink href="#">Web development</HeaderLink>
          <HeaderLink href="#">Interface design</HeaderLink>
        </HeaderMenuContent>
      </HeaderMenu>
      <HeaderMenu>
        <HeaderMenuTrigger>Products</HeaderMenuTrigger>
        <HeaderMenuContent :columns="2">
          <HeaderLink
            v-for="product in products"
            :key="product.title"
            :href="product.href"
            :description="product.description"
          >
            <template #image>
              <!-- Stands in for a product screenshot -->
              <span
                :style="{ display: 'block', width: '140px', height: '70px', background: `linear-gradient(135deg, ${product.from}, ${product.to})` }"
              />
            </template>
            {{ product.title }}
          </HeaderLink>
        </HeaderMenuContent>
      </HeaderMenu>
      <HeaderItem>
        <HeaderLink href="#">Pricing</HeaderLink>
      </HeaderItem>
    </HeaderNav>
    <HeaderActions>
      <Button size="sm">Sign in</Button>
    </HeaderActions>
    <HeaderToggle />
  </Header>
</template>
