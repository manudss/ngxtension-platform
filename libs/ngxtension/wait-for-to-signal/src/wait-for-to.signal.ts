import { Signal, WritableSignal, effect, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

/**
 * Wait for a function to emit an Observable, to subscribe to it, and return to the signal output.
 *
 * @param {() => Observable<TYPE> | null | undefined} observableFunction - The function that returns an observable, null, or undefined.
 * @param {TYPE} initialValue - The initial value of the signal.
 * @returns {Signal<TYPE>} The signal output.
 */
export function waitForToSignal<TYPE>(
	observableFunction: () => Observable<TYPE> | null | undefined,
	initialValue: TYPE,
): Signal<TYPE> {
	const signalOutput: WritableSignal<TYPE> = signal(initialValue);
	let subscription: Subscription | undefined;

	effect(
		() => {
			const source: Observable<TYPE> | null | undefined = observableFunction();

			if (source instanceof Observable) {
				if (subscription) {
					subscription.unsubscribe();
					subscription = undefined;
				}
				subscription = source?.subscribe((newValue: TYPE) => {
					signalOutput.set(newValue);
				});
			}
		},
		{ allowSignalWrites: true },
	);

	return signalOutput;
}
