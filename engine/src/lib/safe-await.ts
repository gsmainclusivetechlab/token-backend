export default function SafeAwait(promise: Promise<any>): Promise<any> {
  return promise.then(data => {
      return [undefined, data];
  })
  .catch(err => [err]);
}