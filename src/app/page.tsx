export default function Home() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold">It Works!</h1>
        <p className="text-muted-foreground">The root page is now loading correctly.</p>
        <p className="mt-4 text-sm text-muted-foreground">
          If you see this, the server issue is resolved. The original redirect logic can now be restored.
        </p>
      </div>
    );
}
