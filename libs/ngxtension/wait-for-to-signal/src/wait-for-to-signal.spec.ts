import { Signal, signal, WritableSignal } from '@angular/core';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import { waitForToSignal } from './wait-for-to.signal';

describe('waitForToSignal', () => {
	describe('when no subscription available', () => {
		it('should return empty signal when no parameters', () => {
			TestBed.runInInjectionContext(() => {
				const received = waitForToSignal(() => null, undefined);
				const expected = signal(undefined);

				expect(received()).toEqual(expected());
			});
		});

		it('should return default value numerique value signal when a numeric default is specified', () => {
			TestBed.runInInjectionContext(() => {
				const received: Signal<number> = waitForToSignal<number>(() => null, 0);

				expect(received()).toEqual(0);
			});
		});

		it('should return default value numerique value signal when a numeric default is specified', () => {
			TestBed.runInInjectionContext(() => {
				const received: Signal<string> = waitForToSignal<string>(
					() => null,
					'default',
				);

				expect(received()).toEqual('default');
			});
		});
	});

	describe('when subscription available', () => {
		it('should return signal with updated value when value is updated', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const observable = of(1);
				const received: Signal<number> = waitForToSignal<number>(
					() => observable,
					0,
				);

				flush();
				expect(received()).toEqual(1);
			});
		}));

		it('should return signal with last value from observable', () => {
			TestBed.runInInjectionContext(
				fakeAsync(() => {
					const observable = of(1, 2, 3);
					const received: Signal<number> = waitForToSignal<number>(
						() => observable,
						0,
					);

					flush();
					expect(received()).toEqual(3);
				}),
			);
		});

		it('should return multiple value, when multiple value set from observable', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const numberSubject = new Subject<number>();
				const received: Signal<number> = waitForToSignal<number>(
					() => numberSubject,
					0,
				);

				flush();
				expect(received()).toEqual(0);
				numberSubject.next(2);
				expect(received()).toEqual(2);
				numberSubject.next(5);
				expect(received()).toEqual(5);
			});
		}));
	});

	describe('when observable change on the page', () => {
		it('should subscribe only when observable was available on input signal', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const observable = of(1);
				const signalObservable: WritableSignal<Observable<number> | undefined> =
					signal<Observable<number> | undefined>(undefined);
				const received: Signal<number> = waitForToSignal<number>(
					() => signalObservable(),
					0,
				);

				flush();

				expect(received()).toEqual(0);
				signalObservable.set(observable);

				flush();

				expect(received()).toEqual(1);
			});
		}));

		it('should subscribe to second observable', fakeAsync(() => {
			TestBed.runInInjectionContext(() => {
				const observable = of(1);
				const signalObservable: WritableSignal<Observable<number> | undefined> =
					signal<Observable<number> | undefined>(undefined);
				const received: Signal<number> = waitForToSignal<number>(
					() => signalObservable(),
					0,
				);

				flush();

				expect(received()).toEqual(0);

				signalObservable.set(observable);
				flush();
				expect(received()).toEqual(1);

				signalObservable.set(of(2));
				flush();
				expect(received()).toEqual(2);
			});
		}));
	});
});
