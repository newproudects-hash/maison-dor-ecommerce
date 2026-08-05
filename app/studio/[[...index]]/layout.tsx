export const metadata = {
  title: 'Maison Dor - Sanity Studio',
  description: 'Gérer les produits et les catégories',
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
