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
</script>

<template>
  <Header position="static">
    <HeaderBrand href="#">Acme</HeaderBrand>
    <HeaderNav>
      <HeaderMenu>
        <HeaderMenuTrigger>Docs</HeaderMenuTrigger>
        <HeaderMenuContent>
          <HeaderLink href="#">Getting started</HeaderLink>
          <HeaderLink href="#">Components</HeaderLink>
          <HeaderLink href="#">Theming</HeaderLink>
        </HeaderMenuContent>
      </HeaderMenu>
      <HeaderItem>
        <HeaderLink href="#" active>Blog</HeaderLink>
      </HeaderItem>
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
