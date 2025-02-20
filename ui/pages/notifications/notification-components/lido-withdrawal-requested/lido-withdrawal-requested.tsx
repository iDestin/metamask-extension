import React from 'react';
import { TRIGGER_TYPES } from '../../../../../app/scripts/controllers/metamask-notifications/constants/notification-schema';
import { type ExtractedNotification, isOfTypeNodeGuard } from '../node-guard';
import type { NotificationComponent } from '../types/notifications/notifications';
import { NotificationListItemIconType } from '../../../../components/multichain/notification-list-item-icon/notification-list-item-icon';

import {
  NotificationDetailAsset,
  NotificationListItem,
  NotificationDetailInfo,
  NotificationDetailButton,
  NotificationDetailCopyButton,
  NotificationDetailTitle,
} from '../../../../components/multichain';
import {
  createTextItems,
  getAmount,
  formatIsoDateString,
  getNetworkDetailsByChainId,
  getUsdAmount,
} from '../../../../helpers/utils/notification.util';
import { t } from '../../../../../app/scripts/translate';
import {
  TextVariant,
  BackgroundColor,
  TextColor,
} from '../../../../helpers/constants/design-system';

import {
  ButtonVariant,
  BadgeWrapperPosition,
  IconName,
} from '../../../../components/component-library';
import { decimalToHex } from '../../../../../shared/modules/conversion.utils';
import { CHAIN_IDS } from '../../../../../shared/constants/network';

type LidoWithdrawalRequestedNotification =
  ExtractedNotification<TRIGGER_TYPES.LIDO_WITHDRAWAL_REQUESTED>;
const isLidoWithdrawalRequestedNotification = isOfTypeNodeGuard([
  TRIGGER_TYPES.LIDO_WITHDRAWAL_REQUESTED,
]);

const getTitle = () => {
  const items = createTextItems(
    [t('notificationItemLidoWithdrawalRequested') || ''],
    TextVariant.bodySm,
  );
  return items;
};

const getDescription = (n: LidoWithdrawalRequestedNotification) => {
  const amount = getAmount(n.data.stake_in.amount, n.data.stake_in.decimals, {
    shouldEllipse: true,
  });
  const description =
    // @ts-expect-error: Expected 0-1 arguments, but got an array
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    t('notificationItemLidoWithdrawalRequestedMessage', [
      `${amount} ${n.data.stake_in.symbol}`,
    ]) || '';
  const items = createTextItems([description], TextVariant.bodyMd);
  return items;
};

export const components: NotificationComponent<LidoWithdrawalRequestedNotification> =
  {
    guardFn: isLidoWithdrawalRequestedNotification,
    item: ({ notification, onClick }) => {
      return (
        <NotificationListItem
          id={notification.id}
          isRead={notification.isRead}
          icon={{
            type: NotificationListItemIconType.Token,
            value: notification.data.stake_in.image,
            badge: {
              icon: IconName.Stake,
              position: BadgeWrapperPosition.bottomRight,
            },
          }}
          title={getTitle()}
          description={getDescription(notification)}
          createdAt={new Date(notification.createdAt)}
          amount={`${getAmount(
            notification.data.stake_in.amount,
            notification.data.stake_in.decimals,
            { shouldEllipse: true },
          )} ${notification.data.stake_in.symbol}`}
          onClick={onClick}
        />
      );
    },
    details: {
      title: ({ notification }) => {
        return (
          <NotificationDetailTitle
            title={t('notificationItemUnStakingRequested') || ''}
            date={formatIsoDateString(notification.createdAt)}
          />
        );
      },
      body: {
        type: 'body_onchain_notification',
        Status: ({ notification }) => (
          <NotificationDetailInfo
            icon={{
              iconName: IconName.Check,
              color: TextColor.successDefault,
              backgroundColor: BackgroundColor.successMuted,
            }}
            label={t('notificationItemStatus') || ''}
            detail={t('notificationItemConfirmed') || ''}
            action={
              <NotificationDetailCopyButton
                text={notification.tx_hash}
                displayText={t('notificationItemTransactionId') || ''}
              />
            }
          />
        ),
        Asset: ({ notification }) => {
          const chainId = decimalToHex(notification.chain_id);
          const { nativeCurrencyLogo } = getNetworkDetailsByChainId(
            `0x${chainId}` as keyof typeof CHAIN_IDS,
          );
          return (
            <NotificationDetailAsset
              icon={{
                src: notification.data.stake_in.image,
                badge: {
                  src: nativeCurrencyLogo,
                  position: BadgeWrapperPosition.topRight,
                },
              }}
              label={t('notificationItemUnStakingRequested') || ''}
              detail={notification.data.stake_in.symbol}
              fiatValue={`${getUsdAmount(
                notification.data.stake_in.amount,
                notification.data.stake_in.decimals,
                notification.data.stake_in.usd,
              )} $`}
              value={`${getAmount(
                notification.data.stake_in.amount,
                notification.data.stake_in.decimals,
                { shouldEllipse: true },
              )} ${notification.data.stake_in.symbol}`}
            />
          );
        },
        AssetReceived: ({ notification }) => {
          const chainId = decimalToHex(notification.chain_id);
          const { nativeCurrencyLogo } = getNetworkDetailsByChainId(
            `0x${chainId}` as keyof typeof CHAIN_IDS,
          );
          return (
            <NotificationDetailAsset
              icon={{
                src: notification.data.stake_in.image,
                badge: {
                  src: nativeCurrencyLogo,
                  position: BadgeWrapperPosition.topRight,
                },
              }}
              label={t('notificationItemUnStakingProvider') || ''}
              detail="Lido-staked ETH"
            />
          );
        },
      },
    },
    footer: {
      type: 'footer_onchain_notification',
      ScanLink: ({ notification }) => {
        const chainId = decimalToHex(notification.chain_id);
        const { nativeBlockExplorerUrl } = getNetworkDetailsByChainId(
          `0x${chainId}` as keyof typeof CHAIN_IDS,
        );
        return (
          <NotificationDetailButton
            variant={ButtonVariant.Secondary}
            text={t('notificationItemCheckBlockExplorer') || ''}
            href={
              nativeBlockExplorerUrl
                ? `${nativeBlockExplorerUrl}//tx/${notification.tx_hash}`
                : '#'
            }
            id={notification.id}
          />
        );
      },
    },
  };
