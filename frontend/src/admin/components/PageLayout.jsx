import React from 'react';

const PageLayout = ({ children }) => {
  const childrenArray = React.Children.toArray(children);
  const content = childrenArray.slice(0, -1);
  const pagination = childrenArray.slice(-1);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content - move padding to inner div */}
      <div className="flex-1">
        <div className="p-6">
          {content}
        </div>
      </div>
      
      {/* Pagination without any padding */}
      <div className="sticky bottom-0 bg-white border-t py-4">
        {pagination}
      </div>
    </div>
  );
};

export default PageLayout;