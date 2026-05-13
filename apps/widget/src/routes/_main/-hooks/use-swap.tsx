import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

const SwapContext = createContext<{} | null>(null)

interface SwapProviderProps {
  children: React.ReactNode
}

export function SwapProvider({ children }: SwapProviderProps) {
  const [sendToken, setSendToken] = useState(TOKENS[0])
  const [receiveToken, setReceiveToken] = useState(TOKENS[3])
  const [sendAmount, setSendAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')
  const [quote, setQuote] = useState(null)
  const [quoteStatus, setQuoteStatus] = useState('idle') // idle | loading | success | error
  const [isFlipping, setIsFlipping] = useState(false)
  const debounceRef = useRef(null)

  const loadQuote = useCallback(async (from, to, rawAmount) => {
    const parsed = parseFloat(rawAmount)
    if (!rawAmount || isNaN(parsed) || parsed <= 0) {
      setReceiveAmount('')
      setQuote(null)
      setQuoteStatus('idle')
      return
    }
    setQuoteStatus('loading')
    try {
      const q = await simulateFetchQuote(from, to, parsed)
      setQuote(q)
      setReceiveAmount(q.outputAmount.toFixed(to.decimals))
      setQuoteStatus('success')
    } catch {
      setQuoteStatus('error')
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(
      () => loadQuote(sendToken, receiveToken, sendAmount),
      450,
    )
    return () => clearTimeout(debounceRef.current)
  }, [sendAmount, sendToken, receiveToken, loadQuote])

  const flipAssets = useCallback(() => {
    if (isFlipping) return
    setIsFlipping(true)
    setTimeout(() => {
      setSendToken((prev) => {
        setReceiveToken(prev)
        return receiveToken
      })
      setSendAmount(receiveAmount || '')
      setReceiveAmount(sendAmount || '')
      setIsFlipping(false)
    }, 300)
  }, [isFlipping, receiveToken, sendAmount, receiveAmount])

  const selectSendToken = useCallback(
    (token) => {
      if (token.symbol === receiveToken.symbol) {
        setReceiveToken(sendToken)
      }
      setSendToken(token)
    },
    [receiveToken, sendToken],
  )

  const selectReceiveToken = useCallback(
    (token) => {
      if (token.symbol === sendToken.symbol) {
        setSendToken(receiveToken)
      }
      setReceiveToken(token)
    },
    [sendToken, receiveToken],
  )

  return (
    <SwapContext.Provider
      value={{
        tokens: TOKENS,
        sendToken,
        receiveToken,
        sendAmount,
        setSendAmount,
        receiveAmount,
        quote,
        quoteStatus,
        isFlipping,
        flipAssets,
        selectSendToken,
        selectReceiveToken,
      }}
    >
      {children}
    </SwapContext.Provider>
  )
}

export const useSwap = () => {
  const context = useContext(SwapContext)
  if (!context) throw new Error(`useSwap must be used inside <SwapProvider>`)
  return context
}
