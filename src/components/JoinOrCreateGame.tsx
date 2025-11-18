import React, { useState } from 'react';
import { useLobby } from './lobby/LobbyContext';
import Popup from './Popup';

const JoinOrCreateGame: React.FC = () => {
  const { createLobby, joinLobby, isLoading } = useLobby();
  const [joinCodeParts, setJoinCodeParts] = useState(['', '', '', '', '', '']);
  const [newLobbyName, setNewLobbyName] = useState('');
  const [popup, setPopup] = useState<{ type: 'confirmation' | 'error' | 'informative'; message: string } | null>(null);

  const handlePartChange = (index: number, value: string, inputs: NodeListOf<HTMLInputElement>) => {
    const sanitizedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 1);
    const updatedParts = [...joinCodeParts];
    updatedParts[index] = sanitizedValue;
    setJoinCodeParts(updatedParts);

    const inputsArray = Array.from(inputs);
    if (sanitizedValue && index < inputsArray.length - 1) {
      const nextInput = inputsArray[index + 1];
      nextInput.focus();
      nextInput.select();
    }
  };

  const handleConfirmJoin = async () => {
    const joinCode = joinCodeParts.join('');
    try {
      await joinLobby(joinCode);
      setPopup({ type: 'confirmation', message: 'Successfully joined the lobby!' });
    } catch (err: any) {
      setPopup({ type: 'error', message: err.message });
    }
    setJoinCodeParts(['', '', '', '', '', '']);
  };

  const handleCreateLobby = async () => {
    try {
      await createLobby(2, false, newLobbyName || undefined);
      setPopup({ type: 'confirmation', message: 'Lobby created successfully!' });
    } catch (err: any) {
      setPopup({ type: 'error', message: err.message });
    }
    setNewLobbyName('');
  };

  const isJoinCodeComplete = joinCodeParts.every((part) => part !== '');

  return (
    <div className="bg-background rounded-2xl shadow-lg text-center w-auto max-w-2xl mx-auto border border-highlight">
      <h2 className="text-highlight text-xl font-bold mb-4 mt-2">Join or Create a lobby</h2>
      <div className="mb-4">
        {/* <h3 className="text-paragraph font-bold mb-2">Join a Game</h3> */}
        <div className="flex justify-center items-center gap-2 m-4">
          {joinCodeParts.map((part, index) => (
            <React.Fragment key={index}>
              <input
                type="text"
                value={part}
                onChange={(e) =>
                  handlePartChange(
                    index,
                    e.target.value,
                    e.currentTarget.parentElement!.querySelectorAll('input')
                  )
                }
                onFocus={(e) => e.target.select()}
                className="w-10 h-10 text-center border border-gray-300 rounded text-highlight bg-transparent font-bold"
                maxLength={1}
                disabled={isLoading}
              />
              {index === 2 && <span className="text-highlight font-bold">-</span>}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-gray-500 mb-4">Format: XXX-XXX (6 alphanumeric characters)</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleConfirmJoin}
            className={`px-4 py-2 rounded transform transition-transform duration-200 ${
              isJoinCodeComplete && !isLoading
                ? 'bg-highlight text-white cursor-pointer hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!isJoinCodeComplete || isLoading}
          >
            {isLoading ? 'Joining...' : 'Join'}
          </button>
          <button
            onClick={handleCreateLobby}
            disabled={isLoading}
            className={`px-4 py-2 rounded transform transition-transform duration-200 ${
              !isLoading
                ? 'bg-highlight text-white cursor-pointer hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Creating...' : 'Create new'}
          </button>
        </div>
      </div>

      {popup && (
        <Popup
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
};

export default JoinOrCreateGame;
