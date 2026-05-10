import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Skillpool",
  description: "Student-only skill-sharing marketplace and community hub for STI College Carmona.",
  icons: {
    icon: "/icons.png?v=3",
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-campus text-[#000100] antialiased">
        <div className="relative min-h-screen">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
