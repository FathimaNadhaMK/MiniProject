import { Loader2 } from "lucide-react"
import "../styles/loading-state.css"

export default function LoadingState({ debugInfo }) {
  return (
    <div className="loading-container">
      <Loader2 className="loading-spinner" />
      <h3 className="loading-title">സമീപത്തുള്ള സ്ഥലങ്ങൾ തിരയുന്നു...</h3>
      <p className="loading-message">ദയവായി കാത്തിരിക്കുക, നിങ്ങളുടെ സ്ഥാനത്തിന് സമീപമുള്ള ടൂറിസ്റ്റ് കേന്ദ്രങ്ങൾ കണ്ടെത്തുന്നു.</p>

      {debugInfo && (
        <div className="debug-info">
          <p>
            <strong>Status:</strong> {debugInfo}
          </p>
        </div>
      )}
    </div>
  )
}
