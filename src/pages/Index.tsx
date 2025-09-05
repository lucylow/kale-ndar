// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  console.log("Index component rendering");
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Stellar KALE-ndar</h1>
        <p className="text-xl text-muted-foreground">Your stellar calendar app starts here!</p>
        <div className="w-32 h-32 bg-primary mx-auto rounded-lg"></div>
      </div>
    </div>
  );
};

export default Index;
