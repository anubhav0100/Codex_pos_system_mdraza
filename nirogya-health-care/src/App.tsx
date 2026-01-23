import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { ProductList } from './components/ProductList';
import { AboutUs } from './components/AboutUs';
import { ContactUs } from './components/ContactUs';
import { Footer } from './components/Footer';

function App() {
  return (
    <>
      <Header />
      <HeroSlider />
      <ProductList />
      <AboutUs />
      <ContactUs />
      <Footer />
    </>
  );
}

export default App;
