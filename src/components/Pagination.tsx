type PaginationPropsType = {
  currentPageNumber: number;
  totalNumberOfPages: number;
  paginate: (selectionType: string, pageNumber: string | number) => void;
};

function Pagination(props: PaginationPropsType) {
  const pageNumbers = [];

  for (let i = 1; i <= 20; i++) pageNumbers.push(i);

  if (props.currentPageNumber > props.totalNumberOfPages)
    props.paginate("Change", props.totalNumberOfPages);

  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, index) => index + start);
  };

  const paginationRange = (
    totalNumberOfPages: number,
    currentPage: number,
    numberOfSiblings: number = 1
  ) => {
    const pageNumbersWithEllipsis = 7 + numberOfSiblings;
    if (pageNumbersWithEllipsis >= totalNumberOfPages)
      return range(1, totalNumberOfPages);
    const leftSiblingIndex = Math.max(currentPage - numberOfSiblings, 1);
    const showLeftEllipsis = leftSiblingIndex > 1;
    const rightSiblingIndex = Math.min(
      currentPage + numberOfSiblings,
      totalNumberOfPages
    );
    const showRightEllipsis = rightSiblingIndex < totalNumberOfPages - 1;
    if (!showLeftEllipsis && showRightEllipsis) {
      const leftItemsCount = 3 + 2 * numberOfSiblings;
      const leftItemsRange = range(1, leftItemsCount);
      return [...leftItemsRange, " ...", totalNumberOfPages];
    } else if (showLeftEllipsis && !showRightEllipsis) {
      const rightItemsCount = 3 + 2 * numberOfSiblings;
      const rightItemsRange = range(
        totalNumberOfPages - rightItemsCount + 1,
        totalNumberOfPages
      );
      return [1, "... ", ...rightItemsRange];
    } else {
      const middleItemsRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, "... ", ...middleItemsRange, " ...", totalNumberOfPages];
    }
  };

  const numberOfPages = paginationRange(
    props.totalNumberOfPages,
    props.currentPageNumber
  );

  return (
    <nav
      className="p-2 w-[80%] lg:w-[82%] isolate inline-flex -space-x-px rounded-md justify-center"
      aria-label="Pagination"
    >
      {props.currentPageNumber === 1 ? (
        ""
      ) : (
        <a
          href="#notes-list"
          onClick={() => props.paginate("Previous", 0)}
          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
        >
          Previous
        </a>
      )}
      {numberOfPages.map((page) => (
        <a
          href="#notes-list"
          aria-current="page"
          key={page}
          onClick={() => props.paginate("Change", page)}
          className={`${
            props.currentPageNumber === page
              ? "bg-indigo-600 focus:z-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 text-white"
              : "ring-1 ring-gray-300 ring-inset text-gray-400 hover:bg-gray-50 focus:outline-offset-0"
          } relative inline-flex items-center px-4 py-2 text-sm font-semibold`}
        >
          {page}
        </a>
      ))}
      {props.currentPageNumber === props.totalNumberOfPages ? (
        ""
      ) : (
        <a
          href="#notes-list"
          onClick={() => props.paginate("Next", 0)}
          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
        >
          Next
        </a>
      )}
    </nav>
  );
}

export default Pagination;
