import React from 'react';
import { t } from '../../../../../app/scripts/translate';
import { TRIGGER_TYPES } from '../../../../../app/scripts/controllers/metamask-notifications/constants/notification-schema';
import { CHAIN_IDS } from '../../../../../shared/constants/network';
import { type ExtractedNotification, isOfTypeNodeGuard } from '../node-guard';
import type { NotificationComponent } from '../types/notifications/notifications';

import {
  NotificationListItem,
  NotificationDetailInfo,
  NotificationDetailNetworkFee,
  NotificationDetailButton,
  NotificationDetailTitle,
  NotificationDetailAsset,
  NotificationDetailCopyButton,
} from '../../../../components/multichain';
import { NotificationListItemIconType } from '../../../../components/multichain/notification-list-item-icon/notification-list-item-icon';
import {
  BadgeWrapperPosition,
  IconName,
  ButtonVariant,
} from '../../../../components/component-library';

import {
  createTextItems,
  getAmount,
  formatIsoDateString,
  getNetworkDetailsByChainId,
  getUsdAmount,
} from '../../../../helpers/utils/notification.util';
import { decimalToHex } from '../../../../../shared/modules/conversion.utils';
import {
  TextVariant,
  BackgroundColor,
  TextColor,
} from '../../../../helpers/constants/design-system';

type StakeNotification = ExtractedNotification<
  | TRIGGER_TYPES.ROCKETPOOL_STAKE_COMPLETED
  | TRIGGER_TYPES.ROCKETPOOL_UNSTAKE_COMPLETED
  | TRIGGER_TYPES.LIDO_STAKE_COMPLETED
  | TRIGGER_TYPES.LIDO_WITHDRAWAL_COMPLETED
>;
const isStakeNotification = isOfTypeNodeGuard([
  TRIGGER_TYPES.ROCKETPOOL_STAKE_COMPLETED,
  TRIGGER_TYPES.ROCKETPOOL_UNSTAKE_COMPLETED,
  TRIGGER_TYPES.LIDO_STAKE_COMPLETED,
  TRIGGER_TYPES.LIDO_WITHDRAWAL_COMPLETED,
]);

const TITLE_MAP = {
  [TRIGGER_TYPES.LIDO_STAKE_COMPLETED]: t('notificationItemStakeCompleted'),
  [TRIGGER_TYPES.LIDO_WITHDRAWAL_COMPLETED]: t(
    'notificationItemUnStakeCompleted',
  ),
  [TRIGGER_TYPES.ROCKETPOOL_STAKE_COMPLETED]: t(
    'notificationItemStakeCompleted',
  ),
  [TRIGGER_TYPES.ROCKETPOOL_UNSTAKE_COMPLETED]: t(
    'notificationItemUnStakeCompleted',
  ),
};

const DIRECTION_MAP = {
  [TRIGGER_TYPES.ROCKETPOOL_STAKE_COMPLETED]: 'staked',
  [TRIGGER_TYPES.ROCKETPOOL_UNSTAKE_COMPLETED]: 'unstaked',
  [TRIGGER_TYPES.LIDO_STAKE_COMPLETED]: 'staked',
  [TRIGGER_TYPES.LIDO_WITHDRAWAL_COMPLETED]: 'unstaked',
} as const;

const STAKING_PROVIDER_MAP = {
  [TRIGGER_TYPES.LIDO_STAKE_COMPLETED]: 'Lido-staked ETH',
  [TRIGGER_TYPES.LIDO_WITHDRAWAL_COMPLETED]: 'Lido-staked ETH',
  [TRIGGER_TYPES.ROCKETPOOL_STAKE_COMPLETED]: 'Rocket Pool-staked ETH',
  [TRIGGER_TYPES.ROCKETPOOL_UNSTAKE_COMPLETED]: 'Rocket Pool-staked ETH',
};

const getTitle = (n: StakeNotification) => {
  const items = createTextItems([TITLE_MAP[n.type] || ''], TextVariant.bodySm);
  return items;
};

const getDescription = (n: StakeNotification) => {
  const direction = DIRECTION_MAP[n.type];
  const items = createTextItems(
    [direction === 'staked' ? n.data.stake_out.symbol : n.data.stake_in.symbol],
    TextVariant.bodyMd,
  );
  return items;
};

export const components: NotificationComponent<StakeNotification> = {
  guardFn: isStakeNotification,
  item: ({ notification, onClick }) => {
    return (
      <NotificationListItem
        id={notification.id}
        isRead={notification.isRead}
        icon={{
          type: NotificationListItemIconType.Token,
          value: notification.data.stake_out.image,
          badge: {
            icon: IconName.Stake,
            position: BadgeWrapperPosition.bottomRight,
          },
        }}
        title={getTitle(notification)}
        description={getDescription(notification)}
        createdAt={new Date(notification.createdAt)}
        amount={getAmount(
          notification.data.stake_out.amount,
          notification.data.stake_out.decimals,
          {
            shouldEllipse: true,
          },
        )}
        onClick={onClick}
      />
    );
  },
  details: {
    title: ({ notification }) => {
      const direction = DIRECTION_MAP[notification.type];
      const title =
        direction === 'staked'
          ? `${t('notificationItemStaked')} ${
              notification.data.stake_in.symbol
            }`
          : `${t('notificationItemUnStaked')} ${
              notification.data.stake_in.symbol
            }`;
      return (
        <NotificationDetailTitle
          title={title}
          date={formatIsoDateString(notification.createdAt)}
        />
      );
    },
    body: {
      type: 'body_onchain_notification',
      Asset: ({ notification }) => {
        const direction = DIRECTION_MAP[notification.type];
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
            label={
              direction === 'staked'
                ? t('notificationItemStaked') || ''
                : t('notificationItemUnStaked') || ''
            }
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
        const direction = DIRECTION_MAP[notification.type];
        const chainId = decimalToHex(notification.chain_id);
        const { nativeCurrencyLogo } = getNetworkDetailsByChainId(
          `0x${chainId}` as keyof typeof CHAIN_IDS,
        );
        return (
          <NotificationDetailAsset
            icon={{
              src: notification.data.stake_out.image,
              badge: {
                src: nativeCurrencyLogo,
                position: BadgeWrapperPosition.topRight,
              },
            }}
            label={
              direction === 'staked'
                ? t('notificationItemStaked') || ''
                : t('notificationItemUnStaked') || ''
            }
            detail={notification.data.stake_out.symbol}
            fiatValue={`${getUsdAmount(
              notification.data.stake_out.amount,
              notification.data.stake_out.decimals,
              notification.data.stake_out.usd,
            )} $`}
            value={`${getAmount(
              notification.data.stake_out.amount,
              notification.data.stake_out.decimals,
              { shouldEllipse: true },
            )} ${notification.data.stake_out.symbol}`}
          />
        );
      },
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
      Provider: ({ notification }) => {
        const direction = DIRECTION_MAP[notification.type];
        const provider = STAKING_PROVIDER_MAP[notification.type];

        return (
          <NotificationDetailAsset
            icon={{
              src: notification.data.stake_out.image,
              badge: {
                src:
                  direction === 'staked'
                    ? notification.data.stake_out.image
                    : notification.data.stake_in.image,
              },
            }}
            label={t('notificationItemStakingProvider') || ''}
            detail={provider}
          />
        );
      },
      NetworkFee: ({ notification }) => {
        return <NotificationDetailNetworkFee notification={notification} />;
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
