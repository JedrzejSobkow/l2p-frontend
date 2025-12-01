import React, { useState, useEffect } from 'react';
import { useLobby } from './lobby/LobbyContext';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used for navigation
import JoinCodeInput from "./JoinCodeInput";

const JoinOrCreateGame: React.FC = () => {
  const { createLobby, joinLobby, currentLobby, isLoading } = useLobby(); // Dodano currentLobby
  const navigate = useNavigate(); // Add navigation hook
  const [joinCodeParts, setJoinCodeParts] = useState(['', '', '', '', '', '']);

  const handlePartChange = (index: number, value: string | string[]) => {
    if (index === -1 && Array.isArray(value)) {
      const updatedParts = [...joinCodeParts];
      value.forEach((char, i) => {
        if (i < updatedParts.length) {
          updatedParts[i] = char;
        }
      });
      setJoinCodeParts(updatedParts);
    } else if (typeof value === "string") {
      const updatedParts = [...joinCodeParts];
      updatedParts[index] = value;
      setJoinCodeParts(updatedParts);
    }
  };

  const handleConfirmJoin = async () => {
    const joinCode = joinCodeParts.join('');
    joinLobby(joinCode);
    setJoinCodeParts(['', '', '', '', '', '']);
  };

  const isJoinCodeComplete = joinCodeParts.every((part) => part !== '');

  useEffect(() => {
    if (currentLobby) {
      navigate(`/lobby`); // Przekierowanie do lobby, jeśli użytkownik już w nim jest
    }
  }, [currentLobby, navigate]);


  return (
    <div className="bg-background rounded-2xl shadow-lg text-center w-auto max-w-2xl mx-auto">
      <h2 className="text-headline text-xl font-bold mb-4 mt-2">Enter your lobby code</h2>
      <div className="mb-4">
        <div className="flex justify-center items-center gap-2 m-4">
          <JoinCodeInput
            joinCodeParts={joinCodeParts}
            onPartChange={handlePartChange}
            isDisabled={isLoading}
          />
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleConfirmJoin}
            className={`px-4 py-2 rounded transform transition-transform duration-200 ${
              isJoinCodeComplete && !isLoading
                ? 'bg-highlight text-white cursor-pointer hover:scale-105'
                : 'bg-inactive-bg text-inactive-text cursor-not-allowed'
            }`}
            disabled={!isJoinCodeComplete || isLoading}
          >
            {isLoading ? 'Joining...' : 'Join'}
          </button>
          <button
            onClick={() => createLobby(2, false, undefined)}
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
    </div>
  );
};

export default JoinOrCreateGame;
