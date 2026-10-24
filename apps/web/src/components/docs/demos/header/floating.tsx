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

// Stands in for a product screenshot
const shot = (from: string, to: string) => (
  <span style={{ display: "block", width: 140, height: 70, background: `linear-gradient(135deg, ${from}, ${to})` }} />
);

const products = [
  { title: "Defied Prism", href: "#", description: "Pick your stack, own your code.", image: shot("#7c3aed", "#e879f9") },
  { title: "Defied Web Configs", href: "#", description: "Your server configs, anywhere.", image: shot("#0d9488", "#67e8f9") },
];

export default function HeaderFloating() {
  return (
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
          <HeaderMenuContent columns={2}>
            {products.map((product) => (
              <HeaderLink key={product.title} href={product.href} description={product.description} image={product.image}>
                {product.title}
              </HeaderLink>
            ))}
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
  );
}
