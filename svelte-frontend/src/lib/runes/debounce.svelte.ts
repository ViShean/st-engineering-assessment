export function createDebounce<T>(getValue: () => T, delay: number){
  let debouncedValue: T = $state(getValue());

  $effect (() => {
    const handler = setTimeout(() => {
      debouncedValue = getValue();
    }, delay);
    return () => clearTimeout(handler);
  });

  return {
    get value(): T { return debouncedValue; }
  };
}