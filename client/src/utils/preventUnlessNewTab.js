export default (e) => {
  if (e.ctrlKey || e.shiftKey || e.metaKey || (e.button && e.button == 1)) {
    return true;
  }
  e.stopPropagation();
  e.preventDefault();
};
