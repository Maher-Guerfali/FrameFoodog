import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeScreenProps {
  userId: string;
  onProceed: () => void;
}

export default function QRCodeScreen({ userId, onProceed }: QRCodeScreenProps) {
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncComplete, setSyncComplete] = useState(false);
  const navigate = useNavigate();

  // Generate a unique sync token for this session
  const syncToken = `ff-sync-${userId}-${Date.now()}`;
  const qrValue = JSON.stringify({
    type: 'frame-sync',
    userId,
    token: syncToken,
    timestamp: Date.now()
  });

  useEffect(() => {
    // Simulate sync process
    const timer = setTimeout(() => {
      setIsSyncing(false);
      setSyncComplete(true);
      
      // Store sync status in localStorage
      localStorage.setItem('ff_sync_complete', 'true');
      localStorage.setItem('ff_sync_token', syncToken);
    }, 3000); // 3 second delay for demo

    return () => clearTimeout(timer);
  }, [syncToken]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Scan to Sync</h1>
          <p className="text-muted-foreground">
            Scan this QR code with your Frame app to sync your device
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg border border-border shadow-sm">
          <div className="flex justify-center mb-4">
            <QRCodeSVG 
              value={qrValue} 
              size={256} 
              level="H"
              includeMargin={true}
              className="w-full max-w-[256px] h-auto"
            />
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm">
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Waiting to sync with Frame...</span>
                </>
              ) : (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Device synced successfully!</span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={onProceed}
              disabled={!syncComplete}
              className="w-full mt-4"
            >
              Proceed to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
