import { useState, useCallback } from 'react'
import { X, Download, ZoomIn, ZoomOut, RotateCw, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configuration du worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function PdfViewerModal({ document: doc, onClose, onDownload }) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pdfError, setPdfError] = useState(false)

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages)
    setCurrentPage(1)
    setPdfError(false)
  }, [])

  const onDocumentLoadError = useCallback(() => {
    setPdfError(true)
  }, [])

  if (!doc) return null

  const fileUrl = doc.fichier_url || doc.fichier || ''
  const isPdf = fileUrl?.toLowerCase().endsWith('.pdf')

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  const goToPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1))
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, numPages || 1))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3 text-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="rounded-lg bg-esi-orange/20 px-2.5 py-1 text-xs font-semibold text-esi-orange">
              {doc.type || 'DOCUMENT'}
            </span>
            <h3 className="truncate text-base font-semibold text-white" title={doc.titre}>
              {doc.titre}
            </h3>
            {doc.matiere_libelle && (
              <span className="hidden text-xs text-slate-400 sm:inline-block">
                ({doc.matiere_code || doc.matiere_libelle})
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {isPdf && (
              <>
                <div className="hidden items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 md:flex">
                  <button
                    onClick={handleZoomOut}
                    className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                    title="Zoom arrière"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-xs font-medium text-slate-300">{zoom}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                    title="Zoom avant"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleRotate}
                  className="hidden rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white sm:block"
                  title="Pivoter"
                >
                  <RotateCw className="h-4 w-4" />
                </button>

                {numPages && numPages > 1 && (
                  <div className="hidden items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 md:flex">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage <= 1}
                      className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-40"
                      title="Page précédente"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="w-20 text-center text-xs font-medium text-slate-300">
                      {currentPage} / {numPages}
                    </span>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage >= numPages}
                      className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-40"
                      title="Page suivante"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {onDownload && (
              <button
                onClick={() => onDownload(doc)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-esi-orange)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-opacity-90 shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="relative flex-1 overflow-auto bg-slate-950/60 p-2 sm:p-4 text-center">
          {fileUrl ? (
            <>
              {isPdf ? (
                pdfError ? (
                  // Fallback si react-pdf échoue (CORS, format invalide)
                  <iframe
                    src={`${fileUrl}#toolbar=1`}
                    className="h-full w-full rounded-xl border border-slate-800 bg-white shadow-lg"
                    title={doc?.titre}
                  />
                ) : (
                  <div className="flex flex-col items-center overflow-auto">
                    <Document
                      file={fileUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex h-64 items-center justify-center text-slate-400">
                          Chargement du PDF…
                        </div>
                      }
                      error={
                        <div className="flex h-64 items-center justify-center text-red-400">
                          Impossible de charger ce document.
                        </div>
                      }
                    >
                      <Page
                        pageNumber={currentPage}
                        scale={zoom / 100}
                        rotate={rotation}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-lg"
                      />
                    </Document>

                    {numPages && numPages > 1 && (
                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2">
                        <button
                          onClick={goToPrevPage}
                          disabled={currentPage <= 1}
                          className="rounded p-1 text-slate-400 hover:text-white disabled:opacity-40"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-xs text-slate-300">
                          Page {currentPage} sur {numPages}
                        </span>
                        <button
                          onClick={goToNextPage}
                          disabled={currentPage >= numPages}
                          className="rounded p-1 text-slate-400 hover:text-white disabled:opacity-40"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-slate-300">
                  <div className="mb-4 rounded-full bg-slate-800 p-6">
                    <ExternalLink className="h-12 w-12 text-esi-orange" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Aperçu non disponible directement</h4>
                  <p className="mt-2 max-w-md text-sm text-slate-400">
                    Ce type de fichier ({doc.type || 'Document'}) nécessite un téléchargement pour être ouvert localement.
                  </p>
                  {onDownload && (
                    <button
                      onClick={() => onDownload(doc)}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-esi-orange px-5 py-2.5 font-medium text-white hover:bg-esi-orange/90"
                    >
                      <Download className="h-5 w-5" />
                      Télécharger le fichier
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              URL de document invalide ou fichier manquant.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
