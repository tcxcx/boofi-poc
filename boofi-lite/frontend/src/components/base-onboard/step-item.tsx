import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { StepItemProps } from '@/lib/types'

const StepItem = React.memo(({ step, title, isCompleted, isActive, children }: StepItemProps) => {
  return (
    <div className={`${isActive || isCompleted ? 'opacity-100' : 'opacity-50'} transition-opacity duration-300`}>
      <div className="flex items-center mb-4">
        <div className={`flex items-center justify-center w-16 h-16 rounded-full ${
          isCompleted 
            ? 'bg-gradient-to-r from-green-400 to-blue-500' 
            : isActive 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
              : 'bg-gray-700'
        } shadow-lg transition-all duration-300 ease-in-out`}>
          {isCompleted ? (
            <CheckCircle2 className="h-8 w-8 text-white" />
          ) : (
            <span className="text-2xl font-bold">{step}</span>
          )}
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-gray-400">
            {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Waiting'}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
})

StepItem.displayName = 'StepItem'

export default StepItem