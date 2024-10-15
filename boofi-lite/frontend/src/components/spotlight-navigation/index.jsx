import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"

const RootContext = createContext()
const ListContext = createContext()

export function Root({
  duration = 500,
  vertical = false,
  fluid = false,
  as: Component = "div",
  children,
  className,
  ...props
}) {
  const [isReady, setReady] = useState(false)
  const [isMounted, setMounted] = useState(false)

  const [activeItem, setActiveItem] = useState({
    index: -1,
    size: 0,
    position: 0,
  })

  // var previousSize = -1
  const [previousSize, setPreviousSize] = useState(-1)
  const [previousPosition, setPreviousPosition] = useState(0)
  const [animated, setAnimated] = useState(true)

  function handleFluidMove(targetSize, targetPosition) {
    if (!animated) {
      return
    }

    setAnimated(false)

    if (previousSize === -1) {
      const size = targetSize
      const position = targetPosition
      setActiveItem((currentState) => ({ ...currentState, size, position }))

      setAnimated(true)
    } else {
      if (targetPosition > previousPosition) {
        const size = targetSize + targetPosition - previousPosition
        setActiveItem((currentState) => ({ ...currentState, size }))

        setTimeout(() => {
          const size = targetSize
          const position = targetPosition
          setActiveItem((currentState) => ({ ...currentState, size, position }))

          setAnimated(true)
        }, duration)
      } else {
        const position = targetPosition
        const size = previousSize + previousPosition - targetPosition

        setActiveItem((currentState) => ({
          ...currentState,
          size,
          position,
        }))

        setTimeout(() => {
          const size = targetSize

          setActiveItem((currentState) => ({ ...currentState, size }))

          setAnimated(true)
        }, duration)
      }
    }

    setPreviousSize(targetSize)
    setPreviousPosition(targetPosition)
  }

  function setActive(index, size, position) {
    setActiveItem((currentState) => ({ ...currentState, index }))

    if (fluid) {
      handleFluidMove(size, position)
    } else {
      setActiveItem((currentState) => ({ ...currentState, size, position }))
    }

    setReady(true)
  }

  const context = {
    setActive,
    activeItem,
    isReady,
    setMounted,
    isMounted,
    isFluid: fluid,
    isVertical: vertical,
    duration: duration,
  }

  return (
    <RootContext.Provider value={context}>
      <Component className={className} {...props}>
        {children({
          ready: isReady,
          position: `${activeItem.position}px`,
          duration: `${duration}ms`,
          size: `${activeItem.size}px`,
        })}
      </Component>
    </RootContext.Provider>
  )
}

export function List({ as: Component = "div", children, className, ...props }) {
  const container = useRef(null)

  const [childElements, setChildElements] = useState([])

  useEffect(() => {
    if (container.current) {
      setChildElements(Array.from(container.current.children))
    }
  }, [])

  const context = { peers: childElements }

  return (
    <ListContext.Provider value={context}>
      <Component ref={container} className={className} {...props}>
        {children}
      </Component>
    </ListContext.Provider>
  )
}

export function Item({ onActivated = () => {}, active = false, as: Component = "div", children, className, ...props }) {
  const rootContext = useContext(RootContext)
  const listContext = useContext(ListContext)

  const container = useRef(null)

  const index = useMemo(() => {
    return listContext.peers ? listContext.peers.indexOf(container.current) : -1
  }, [listContext.peers])

  const isActive = useMemo(() => index == listContext.activeItem, [listContext.activeItem, index])

  // once
  useEffect(() => {
    if (active) {
      setActive(false)
    }

    if (index === listContext.peers.length - 1) {
      rootContext.setMounted()
    }
  }, [index])

  useEffect(() => {
    // set first element as active
    if (rootContext.activeItem.index === -1 && index === 0) {
      setActive(false)
    }
  }, [rootContext.isMounted])

  function setActive(event) {
    if (rootContext.isVertical) {
      rootContext.setActive(index, container.current.getBoundingClientRect().height, container.current.offsetTop)
    } else {
      rootContext.setActive(index, container.current.getBoundingClientRect().width, container.current.offsetLeft)
    }

    if (event != false) {
      setTimeout(() => onActivated(), rootContext.duration)
    }
  }

  return (
    <Component ref={container} className={className} {...props}>
      {children({ setActive, isActive })}
    </Component>
  )
}

export const Navigation = Object.assign(Root, { List, Item })
