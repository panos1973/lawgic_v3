'use client'

interface HistoryHeaderProps {
  selectedChats: string[]
  handleMassDelete: () => Promise<void>
  setSelectedChats: React.Dispatch<React.SetStateAction<string[]>>
  isMassDelete: boolean
  chatHistoryTranslations: {
    history: string
    massDelete: string
    cancel: string
    accept: string
  }
  setIsMassDelete: React.Dispatch<React.SetStateAction<boolean>>
}
const HistoryHeader = ({
  selectedChats,
  handleMassDelete,
  setSelectedChats,
  isMassDelete,
  setIsMassDelete,
  chatHistoryTranslations,
}: HistoryHeaderProps) => {
  return (
    <div className="flex justify-between items-center px-2 mb-4">
      <p className="text-xs font-semibold tracking-wide uppercase text-slate-600">
        {chatHistoryTranslations.history}
      </p>
      <div className="flex items-center">
        {isMassDelete && selectedChats.length > 0 && (
          <button
            className="text-xs font-semibold text-red-600 mr-2"
            onClick={handleMassDelete}
          >
            {chatHistoryTranslations.accept}
          </button>
        )}
        <button
          className="text-sm text-red-600"
          onClick={() => setIsMassDelete(!isMassDelete)}
        >
          {isMassDelete ? (
            <span
              className="text-xs font-semibold text-[#59524c]"
              onClick={() => setSelectedChats([])}
            >
              {chatHistoryTranslations.cancel}
            </span>
          ) : (
            <span className="text-xs font-semibold text-red-600">
              {chatHistoryTranslations.massDelete}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default HistoryHeader
