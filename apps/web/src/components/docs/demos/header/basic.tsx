import { Button } from "@/components/ui/Button";
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
} from "@/components/ui/Header";

export default function HeaderBasic() {
  return (
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
          <HeaderLink href="#" active>
            Blog
          </HeaderLink>
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
  );
}
