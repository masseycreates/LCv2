import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLottery } from '@/contexts/LotteryContext';
import { claudeService } from '@/services/claudeService';
import { powerballService } from '@/services/powerballService';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import SelectionDisplay from './SelectionDisplay';
import Banner from '@components/ui/Banner';

function QuickSelection() {
  const { 
    isClaudeEnabled, 
    claudeApiKey,
    setClaudeApiKey,
    setClaudeConnectionStatus,
    addNotification
  } = useApp();
  
  const {
    historicalStats,
    currentJackpot,
    quickSelectionSets,
    setQuickSelections
  } = useLottery();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGeneratingSelections, setIsGeneratingSelections] = useState(false);
  const [historicalData, setHistoricalData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('claude-3-opus-20240229');

  const availableModels = claudeService.getAvailableModels();

  // Load historical data on component mount with 2000 drawings
  useEffect(() => {
    loadHistoricalData();
  }, []);

  const loadHistoricalData = async () => {
    setLoadingData(true);
    setError(null);
    
    try {
      const result = await powerballService.getHistoricalData(2000); // Default to 2000
      setHistoricalData(result);
      
      addNotification({
        type: 'success',
        message: `Loaded ${result.analysis.totalDrawings} historical drawings for analysis`
      });
    } catch (err) {
      const errorMessage = err.code === 'NETWORK_ERROR' 
        ? 'Cannot connect to lottery data servers. Please check your internet connection and try again.'
        : err.code === 'API_ERROR'
        ? 'Lottery data service is temporarily unavailable. Please try again in a few minutes.'
        : err.code === 'NO_DATA'
        ? 'No historical lottery data is available. The analysis requires real drawing data to function.'
        : `Failed to load lottery data: ${err.message}`;
      
      setError(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  const handleEnableClaude = async () => {
    const trimmedKey = apiKeyInput.trim();
    
    if (!trimmedKey) {
      addNotification({
        type: 'error',
        message: '