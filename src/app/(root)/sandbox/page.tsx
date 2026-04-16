"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wand2, Code2, Play, Info } from "lucide-react";

export default function SandboxPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ code: string; previewUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (result?.previewUrl) {
      setIsExpired(false);
      // Sandbox expires after ~5 minutes on E2B, we show warning slightly before
      const timer = setTimeout(() => {
        setIsExpired(true);
      }, 4.9 * 60 * 1000); 

      return () => clearTimeout(timer);
    }
  }, [result?.previewUrl]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate UI");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-60px)] w-full text-foreground relative z-50">
      {/* Sidebar / Input Area */}
      <div className="w-full md:w-[350px] border-r border-border bg-background p-6 flex flex-col gap-4 overflow-y-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-primary" />
          AI Sandbox
        </h1>
        <p className="text-muted-foreground text-sm">
          Describe the interface you want to create. Powered by Gemini and E2B Sandbox.
        </p>

        <div className="mt-4 flex-1 flex flex-col gap-4">
          <Textarea 
            placeholder="A beautiful pricing page with 3 tiers..." 
            className="min-h-[150px] resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            className="w-full" 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate UI"
            )}
          </Button>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 relative overflow-hidden flex flex-col bg-background/50">
        {!result && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Wand2 className="w-12 h-12 mb-4 opacity-20" />
            <p>Enter a prompt on the left to generate code + preview.</p>
          </div>
        )}

        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground animate-pulse text-center space-y-2">
            <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
            <p className="text-lg font-medium text-foreground">Creating your sandbox...</p>
            <p className="text-sm text-amber-500 font-semibold bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
              Please don't close the browser or change tabs.
            </p>
          </div>
        )}

        {result && !isLoading && (
          <Tabs defaultValue="preview" className="flex-1 flex flex-col h-full w-full">
            <div className="flex flex-row flex-wrap justify-between items-center mb-4 gap-4 w-full">
              <TabsList className="w-fit">
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Play className="w-4 h-4" /> Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" /> Code
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-md border border-amber-500/20">
                <Info className="w-4 h-4" />
                Note: Cloud previews are temporary and expire after 5 minutes.
              </div>
            </div>
            
            <TabsContent value="preview" className="flex-1 border rounded-md overflow-hidden bg-white/5 data-[state=active]:flex relative">
              {isExpired ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900/50 p-8 text-center m-auto">
                  <Play className="w-12 h-12 text-zinc-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Sandbox Expired</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    This live preview has shut down automatically to save resources. You can still copy the generated UI from the <span className="font-semibold">Code</span> tab or click <span className="font-semibold">Generate</span> to spin up a fresh instance!
                  </p>
                </div>
              ) : (
                <iframe 
                  src={result.previewUrl} 
                  className="w-full h-full border-none bg-white"
                  title="E2B Sandbox Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              )}
            </TabsContent>
            
            <TabsContent value="code" className="flex-1 border rounded-md overflow-hidden bg-zinc-950 p-4 data-[state=active]:flex flex-col">
              <pre className="overflow-auto text-sm text-zinc-50 font-mono flex-1">
                <code>{result.code}</code>
              </pre>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
