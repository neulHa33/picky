import React, { useState } from 'react';

const Picky = () => {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [pickedItem, setPickedItem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      if (items.includes(newItem.trim())) {
        setError('이미 추가된 아이템입니다.');
      } else {
        setItems([...items, newItem.trim()]);
        setNewItem('');
        setError(null);
      }
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setItems(items.filter(item => item !== itemToRemove));
  };

  const handlePickRandomItem = () => {
    if (items.length === 0) {
      setPickedItem(null);
      setError("아이템이 추가되지 않았습니다.");
      return;
    }
    const randomIndex = Math.floor(Math.random() * items.length);
    const randomItem = items[randomIndex];
    setPickedItem(randomItem);
    setError(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">

      <div className="flex mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="아이템을 입력해 주세요."
          className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddItem}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          추가
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">아이템</h2>
        {items.length === 0 ? (
            <p className='text-center text-gray-500'>아이템이 추가되지 않았습니다.</p>
        ) : (
            <ul className="list-disc pl-5 space-y-2">
                {items.map((item, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <span>{item}</span>
                    <button
                    onClick={() => handleRemoveItem(item)}
                    className="text-red-500 hover:text-red-700 font-bold"
                    >
                    &times;
                    </button>
                </li>
                ))}
            </ul>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={handlePickRandomItem}
          disabled={items.length < 2}
          className="bg-green-500 text-white px-6 py-3 rounded-md text-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          랜덤 아이템 선택
        </button>
      </div>

      {pickedItem && (
        <div className="mt-6 text-center p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-xl mt-2 text-indigo-600 animate-pulse">{pickedItem}</p>
        </div>
      )}
    </div>
  );
};

export default Picky; 