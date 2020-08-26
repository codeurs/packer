import styles from './style'
import {ReactComponent as Test} from './test.svg'
import asUrl from './test.svg'
import {render} from 'react-dom'
import React from 'react'

console.log(styles)
console.log(<Test />)
console.log(asUrl)

console.log(Array.from(new Set([1, 2, 3])).join(', '))

render(
	<div>
		hello 123 svg: <Test />
	</div>,
	document.getElementById('root')
)
