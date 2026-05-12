export function createDebounce<T>(getValue: () => T, delay: number){
  let debouncedValue: T = $state(getValue());

  $effect (() => {
    const current = getValue(); // read synchronously so Svelte tracks the dependency
    const handler = setTimeout(() => {
      debouncedValue = current;
    }, delay);
    return () => clearTimeout(handler);
  });

  return {
    get value(): T { return debouncedValue; }
  };
}