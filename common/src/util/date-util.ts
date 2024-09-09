export const DateUtil = (() => {
  function formatDateOnlyUtcIso(date: Date): string {
    console.log("Date", date, typeof date);
    console.log(date.getUTCFullYear());
    return `${date.getUTCFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  }

  return {
    formatDateOnlyUtcIso,
  };
})();
