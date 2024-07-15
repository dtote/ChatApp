import React from 'react'

function GenderCheckBox() {
  return (
    <div className='flex'>
      <div className='form-control'>
        <label className="label-text">
          <span className='switch'>Male</span>
          <input type='checkbox' className='checkbox border-slate-900' />
        </label>
      </div>
      <div>
        <label className="label-text">
          <span className='switch'>Male</span>
          <input type='checkbox' className='checkbox border-slate-900' />
        </label>
      </div>
    </div>
  )
}

export default GenderCheckBox
