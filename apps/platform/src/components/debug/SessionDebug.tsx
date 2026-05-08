'use client'

import { useState } from 'react'
import { useSession } from '../providers/SessionProvider'
import { sessionStore } from '../../lib/session-store'
import { Card, Button } from '@strata-noble/ui'
import { ChevronDown, ChevronUp, Trash2, RefreshCw, Database, Clock } from 'lucide-react'

export function SessionDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const session = useSession()
  const sessionInfo = sessionStore.getSessionInfo()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleClearSession = () => {
    if (confirm('Clear session? This will not affect the database.')) {
      sessionStore.reset()
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Card className="bg-gray-900 text-white border-gray-700 shadow-xl">
        <div className="p-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-between text-white border-gray-600 hover:bg-gray-800"
          >
            <span className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Session Debug</span>
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {isOpen && (
            <div className="mt-4 space-y-4 min-w-64">
              <div>
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Session Status</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>User:</span>
                    <span className={sessionInfo.hasUser ? 'text-green-400' : 'text-red-400'}>
                      {sessionInfo.hasUser ? sessionInfo.userEmail : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Can Log:</span>
                    <span className={sessionInfo.canLogAction ? 'text-green-400' : 'text-red-400'}>
                      {sessionInfo.canLogAction ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Sync:</span>
                    <span className="text-gray-400">
                      {sessionInfo.lastSync
                        ? new Date(sessionInfo.lastSync).toLocaleTimeString()
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Preferences</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Phase:</span>
                    <span className="text-purple-400">{sessionInfo.preferences.preferredPhase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto Reframe:</span>
                    <span className={sessionInfo.preferences.autoReframe ? 'text-green-400' : 'text-red-400'}>
                      {sessionInfo.preferences.autoReframe ? 'On' : 'Off'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Theme:</span>
                    <span className="text-blue-400">{sessionInfo.preferences.theme}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => session.syncWithDatabase()}
                  className="flex-1 text-white border-gray-600 hover:bg-gray-800"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSession}
                  className="flex-1 text-red-400 border-red-600 hover:bg-red-900"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>

              <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Session stored in browser memory</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
