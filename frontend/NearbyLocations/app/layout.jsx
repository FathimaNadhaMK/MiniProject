import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "സമീപത്തുള്ള ടൂറിസ്റ്റ് കേന്ദ്രങ്ങൾ",
  description: "നിങ്ങളുടെ സ്ഥാനത്തിന് സമീപമുള്ള ടൂറിസ്റ്റ് കേന്ദ്രങ്ങൾ കണ്ടെത്തുക",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="ml">
      <body className={inter.className}>{children}</body>
    </html>
  )
}


import './globals.css'