'use client';

import { useState } from 'react';
import { usePokemonStore } from '@/lib/store';
import { parseAICommand, executeAICommand } from '@/lib/ai-commands';
import { MessageCircle, Send, X, Bot, CheckCircle, AlertCircle } from 'lucide-react';

interface AIChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatOverlay = ({ isOpen, onClose }: AIChatOverlayProps) => {
  const { pokemon, setPokemon } = usePokemonStore();
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isProcessing) return;

    setIsProcessing(true);
    setLastResult(null);

    try {
      const parsedCommand = parseAICommand(command);
      
      if (!parsedCommand) {
        setLastResult({
          success: false,
          message: 'I couldn\'t understand that command. Try using patterns like:\n• "set hp to 100 for all pokemon of type \'grass\'"\n• "delete rows where generation is 1"\n• "update ability to \'levitate\' where name is \'gengar\'"'
        });
        return;
      }

      const result = executeAICommand(parsedCommand, pokemon);
      
      if (result.success) {
        setPokemon(result.updatedPokemon);
        setLastResult({
          success: true,
          message: result.message
        });
        setCommand('');
      } else {
        setLastResult({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      setLastResult({
        success: false,
        message: `Error processing command: ${error}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">AI Data Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm text-gray-700">
                  Hi! I can help you manipulate your Pokémon data using natural language commands. 
                  Try asking me to:
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• "set hp to 100 for all pokemon of type 'grass'"</li>
                  <li>• "delete rows where generation is 1"</li>
                  <li>• "update ability to 'levitate' where name is 'gengar'"</li>
                </ul>
              </div>
            </div>

            {/* Last Result */}
            {lastResult && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {lastResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className={`rounded-lg p-3 max-w-[80%] ${
                  lastResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <p className={`text-sm ${
                    lastResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {lastResult.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type your command here..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !command.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

